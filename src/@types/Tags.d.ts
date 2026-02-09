export interface TagTrees2 {
  [teamCode: string]: TeamTag;
}

export interface TeamTag {
  completeTrees?: CompleteTrees;
  subTrees?: SubTrees;
}

export type TeamTagTreeJSON = string;
export type SingleTree = {
  lastUpdated: number;
  tagTree: tagTreeJSON;
};

type tagTreeJSON = string; // JSON of TeamTagTree
export type CompleteTrees = {
  [tagTreeCode: string]: SingleTree;
};

// tagId is for admin tags
export type SubTrees = {
  [tagTreeCode: string]: {
    [tagId: string]: SingleTree;
  };
};

export interface TeamTagTree {
  children: TeamTagTree[];
  code: string;
  title: string;
  is_custom_node?: boolean;
  expanded?: boolean;
}

export interface TagNode {
  code: string;
  title: string;
  titleWithCount?: string;
  selected?: string;
  expanded?: boolean;
  children?: TagNode[];
  is_custom_node?: boolean;
}
interface TreeProps {
  nodes: TagNode[];
  isTopLevel: boolean;
  allNodes: TagNode[];
}

// tags list with tagid: tagcount how many time used inside subscribed modules
export type TagCounts = Map<string, Set<string>>;
// tags record list with the tagsid: tag title
export type TagLabels = Record<string, string>;
