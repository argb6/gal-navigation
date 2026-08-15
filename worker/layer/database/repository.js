/**
 * 数据访问层 — Repository
 * 统一数据访问入口，组合 D1 + KV 查询
 * 
 * 按页面组织，每个页面需要的数据一次性并行获取
 */

import { fetchNavData, fetchSiteByKey, fetchFriendLinks, insertFriendLink, fetchPalaceGroups } from "./d1.js";
import { fetchHeroImages, fetchFeaturedKeys, fetchDonors, fetchNotice } from "./kv.js";

/** 首页数据（轮播图 + 推荐项） */
export async function fetchHomeData(env) {
  const [heroImages, featuredKeys] = await Promise.all([
    fetchHeroImages(env),
    fetchFeaturedKeys(env),
  ]);
  return { heroImages, featuredKeys };
}

/** 主站导航页完整数据（站点列表 + 轮播图 + 推荐项） */
export async function fetchWebsearchData(env) {
  const [navData, heroImages, featuredKeys] = await Promise.all([
    fetchNavData(env),
    fetchHeroImages(env),
    fetchFeaturedKeys(env),
  ]);
  return { navData, heroImages, featuredKeys };
}

/** 详情页数据 */
export async function fetchDetailData(env, itemKey) {
  return fetchSiteByKey(env, itemKey);
}

/** 友链页数据 */
export async function fetchFriendData(env) {
  return fetchFriendLinks(env);
}

/** 友链提交 */
export async function submitFriendLink(env, data) {
  return insertFriendLink(env, data);
}

/** 殿堂页数据 */
export async function fetchPalaceData(env) {
  return fetchPalaceGroups(env);
}

/** 捐献页数据 */
export async function fetchDonateData(env) {
  return fetchDonors(env);
}

/** 状态页公告 */
export async function fetchNoticeData(env) {
  return fetchNotice(env);
}
