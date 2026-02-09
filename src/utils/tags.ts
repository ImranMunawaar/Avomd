import {
  CompleteTrees,
  SingleTree,
  SubTrees,
  TeamTagTree,
  TeamTagTreeJSON,
} from "../@types/Tags";

// combineTagTree function is used for adding the team sub tree inside the admin tree
export const combineTagTrees = (
  subTrees: SubTrees,
  adminTree: CompleteTrees
): SingleTree[] => {
  const combinedTrees = Object.entries(adminTree).map(
    ([adminTagCode, adminTree]) => {
      const tree = JSON.parse(adminTree?.tagTree || "{}");
      addSubTree(tree, adminTagCode, subTrees);
      return {
        tagTree: JSON.stringify(tree) as TeamTagTreeJSON,
        lastUpdated: adminTree.lastUpdated,
      };
    }
  );
  return combinedTrees;
};

// addSubTree function using inside combineTagTrees for adding subtree child
export const addSubTree = (
  treeJson: TeamTagTree[],
  adminTreeCode: string,
  subTrees: SubTrees
) => {
  for (let node of treeJson) {
    addSubTree(node.children, adminTreeCode, subTrees);
    const subTree = subTrees?.[adminTreeCode]?.[node?.code];
    if (subTree) {
      node.children.push(...JSON.parse(subTree?.tagTree || "{}"));
    }
  }
};
// admin trees id for staging/production db
export const TAG_TREE_ADMIN_ID = {
  // old structure staging key team_k11ef_code and tested team team_ymf0g_code
  STAGING: "team_k11ef_code",
  PRODUCTION: "team_r81qe_code",
};
