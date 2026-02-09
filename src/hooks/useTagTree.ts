import { Calc2, Module } from "@avomd/type-structure/realtimeDB";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  SingleTree,
  TagCounts,
  TagLabels,
  TagTrees2,
  TagNode,
} from "../@types/Tags";
import { tagCountsAtom, tagLabelsAtom } from "../modals/FilterByTagsModal";
import { combineTagTrees, TAG_TREE_ADMIN_ID } from "../utils/tags";
import { useAllItems } from "./useListItems";
import { isLiveSelector } from "../selectors";
import store, { selectors } from "../store";
import { useSelector } from "react-redux";

export function useTagTree({ teamCode }: { teamCode: string }) {
  // console.log('useTagTree');
  const tagList = useSelector(
    (state: any) => removeNullUndefined(state.persist.data.tagTrees2) || {}
  );

  const [tagTreeData, setTagTreeData] = useState<TagNode[]>([]);
  const tagCounts = useTagCounts();
  const [, setTagLabels] = useAtom(tagLabelsAtom);
  useEffect(() => {
    const nodes = getTagTreeList({ tagList, teamCode });
    const tagsLabels = {};
    getTagLabelsFromAllTrees(tagList, tagsLabels);
    getTagLabelsFromTeamTrees(nodes, tagsLabels);
    addChildSetToParent(nodes, tagCounts);

    const validTags = filterEmptyNode(nodes, tagCounts);

    setTagLabels(tagsLabels);
    setTagTreeData(validTags);
  }, [teamCode, tagList, tagCounts, setTagLabels]);
  return tagTreeData;
}

/**
 * function to remove all null and undefined values from data object
 * this is to prevent the app from crashing when the data is not available
 * @param data
 */
const removeNullUndefined = (data: any) => {
  for (var key in data) {
    if (data[key] === null || data[key] === undefined) {
      delete data[key];
    } else {
      for (var key2 in data[key]) {
        if (data[key][key2] === null || data[key][key2] === undefined) {
          delete data[key][key2];
        }
      }
    }
  }
  return data;
};

export function filterEmptyNode(
  nodes: TagNode[],
  tagCounts?: TagCounts
): TagNode[] {
  return nodes.filter((node) => {
    if (node.children) {
      const childNodes = filterEmptyNode(node.children, tagCounts);
      if (childNodes.length > 0) {
        node.children = childNodes;
      } else {
        delete node.children;
      }
    }
    return (tagCounts?.get(node.code)?.size || 0) > 0;
  });
}

export function addChildSetToParent(
  nodes: TagNode[],
  tagsCounts: TagCounts
): Set<string> {
  return nodes.reduce((sibilingSet, node) => {
    if (node.children) {
      const childSet = addChildSetToParent(node.children, tagsCounts);
      const oldSet = tagsCounts.get(node.code) || [];
      tagsCounts.set(node.code, new Set([...oldSet, ...childSet]));
    }

    const count = tagsCounts.get(node.code)?.size || 0;
    node.titleWithCount = `${node.title} ${count > 0 ? "(" + count + ")" : ""}`;

    const newSet = new Set([
      ...sibilingSet,
      ...(tagsCounts.get(node.code) || []),
    ]);
    return newSet;
  }, new Set<string>());
}

export function useTagCounts() {
  const items = useAllItems();
  const [tagCounts, setTagCounts] = useAtom(tagCountsAtom);
  useEffect(() => {
    // console.log('useTagCounts useEffect');
    const tagCounts = getTagCount(items);
    setTagCounts(tagCounts);
  }, [items, setTagCounts]);
  return tagCounts;
}

function getTagCount(items: (Module | Calc2)[]) {
  const tagCounts = items.reduce((map, item) => {
    if (!item) return map;
    ((item.tags || []) as string[]).forEach((tag) => {
      if (map.has(tag)) {
        map.get(tag).add(item.code);
      } else {
        map.set(tag, new Set([item.code]));
      }
    });
    return map;
  }, new Map());
  return tagCounts;
}

function getTagLabelsFromTeamTrees(nodes: TagNode[], tagsLabels: TagLabels) {
  nodes.forEach((node) => {
    tagsLabels[node.code] = node.title;
    if (node.children) {
      getTagLabelsFromTeamTrees(node.children, tagsLabels);
    }
  });
  return tagsLabels;
}
function getTagLabelsFromAllTrees(tagList: TagTrees2, tagsLabels: TagLabels) {
  const singleTreeArr = Object.values(tagList).map(
    ({ completeTrees, subTrees }) => {
      const com = Object.values(completeTrees || {});
      const sub: SingleTree[] = Object.values(subTrees || {})
        .map(Object.values)
        .flat();
      const singleTree = [...com, ...sub];
      return singleTree;
    }
  );
  const nodes = singleTreeArr.flat().map(parseJSONTreeArr);
  getTagLabelsFromTeamTrees(nodes, tagsLabels);
}

function getTagTreeList({
  tagList,
  teamCode,
}: {
  tagList: TagTrees2;
  teamCode: string;
}) {
  const adminTeamId = isLiveSelector(store.getState())
    ? TAG_TREE_ADMIN_ID.PRODUCTION
    : TAG_TREE_ADMIN_ID.STAGING;

  // admin and team tree from the redux store
  const adminTagTree = tagList[adminTeamId] || {};
  const teamTagTree = tagList[teamCode] || {};

  const adminTree = adminTagTree?.completeTrees || {};

  // Team tag tree may contain subTrees and completeTrees or none of them
  // In case none admin tree will be displayed
  const teamCustomTreeArr = Object.values(teamTagTree.completeTrees || {});
  const subTreesArr = combineTagTrees(teamTagTree.subTrees || {}, adminTree);
  const combinedTreeArr = [...subTreesArr, ...teamCustomTreeArr];
  return combinedTreeArr.map(parseJSONTreeArr);
}

function parseJSONTreeArr(singleTree: SingleTree) {
  return JSON.parse(singleTree.tagTree)[0] as TagNode;
}
