import path from "path";
import Bluebird from "bluebird";
import kuromoji, { type IpadicFeatures, type Tokenizer } from "kuromoji";
import analyze from "negaposi-analyzer-ja";
import { Router } from "express";
import { Op } from "sequelize";

import { Post } from "@web-speed-hackathon-2026/server/src/models";
import { PUBLIC_PATH } from "@web-speed-hackathon-2026/server/src/paths";
import { parseSearchQuery } from "@web-speed-hackathon-2026/server/src/utils/parse_search_query.js";

export const searchRouter = Router();

let tokenizerCache: Tokenizer<IpadicFeatures> | null = null;

async function getTokenizer(): Promise<Tokenizer<IpadicFeatures>> {
  if (tokenizerCache) return tokenizerCache;
  const builder = Bluebird.promisifyAll(
    kuromoji.builder({ dicPath: path.join(PUBLIC_PATH, "dicts") }),
  );
  tokenizerCache = await builder.buildAsync();
  return tokenizerCache;
}

async function checkNegative(text: string): Promise<boolean> {
  try {
    const tokenizer = await getTokenizer();
    const tokens = tokenizer.tokenize(text);
    const score = analyze(tokens);
    return score < -0.1;
  } catch {
    return false;
  }
}

searchRouter.get("/search", async (req, res) => {
  const query = req.query["q"];

  if (typeof query !== "string" || query.trim() === "") {
    return res.status(200).type("application/json").send({ isNegative: false, posts: [] });
  }

  const { keywords, sinceDate, untilDate } = parseSearchQuery(query);

  // キーワードも日付フィルターもない場合は空配列を返す
  if (!keywords && !sinceDate && !untilDate) {
    return res.status(200).type("application/json").send({ isNegative: false, posts: [] });
  }

  // ネガポジ判定を行い、ネガティブなら検索せずに返却
  const isNegative = keywords ? await checkNegative(keywords) : false;
  if (isNegative) {
    return res.status(200).type("application/json").send({ isNegative: true, posts: [] });
  }

  const searchTerm = keywords ? `%${keywords}%` : null;
  const limit = req.query["limit"] != null ? Number(req.query["limit"]) : undefined;
  const offset = req.query["offset"] != null ? Number(req.query["offset"]) : undefined;

  // 日付条件を構築
  const dateConditions: Record<symbol, Date>[] = [];
  if (sinceDate) {
    dateConditions.push({ [Op.gte]: sinceDate });
  }
  if (untilDate) {
    dateConditions.push({ [Op.lte]: untilDate });
  }
  const dateWhere =
    dateConditions.length > 0 ? { createdAt: Object.assign({}, ...dateConditions) } : {};

  // テキスト検索条件
  const textWhere = searchTerm ? { text: { [Op.like]: searchTerm } } : {};

  const postsByText = await Post.findAll({
    limit,
    offset,
    where: {
      ...textWhere,
      ...dateWhere,
    },
  });

  // ユーザー名/名前での検索（キーワードがある場合のみ）
  let postsByUser: typeof postsByText = [];
  if (searchTerm) {
    postsByUser = await Post.findAll({
      subQuery: false,
      include: [
        {
          association: "user",
          attributes: { exclude: ["profileImageId"] },
          include: [{ association: "profileImage" }],
          required: true,
          where: {
            [Op.or]: [{ username: { [Op.like]: searchTerm } }, { name: { [Op.like]: searchTerm } }],
          },
        },
        {
          association: "images",
          through: { attributes: [] },
        },
        { association: "movie" },
        { association: "sound" },
      ],
      limit,
      offset,
      where: dateWhere,
    });
  }

  const postIdSet = new Set<string>();
  const mergedPosts: typeof postsByText = [];

  for (const post of [...postsByText, ...postsByUser]) {
    if (!postIdSet.has(post.id)) {
      postIdSet.add(post.id);
      mergedPosts.push(post);
    }
  }

  mergedPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const result = mergedPosts.slice(offset || 0, (offset || 0) + (limit || mergedPosts.length));

  return res.status(200).type("application/json").send({ isNegative: false, posts: result });
});
