import { TagNode } from "../@types/Tags";
import images from "../images";

const checkType = {
  CHECKED: "checked",
  UNCHECKED: "unchecked",
  PARTIAL: "partial",
};
const hasChildren = (item: TagNode): boolean => {
  return item.children && item.children.length > 0 ? true : false;
};
const getCheckboxImage = (selected: string) => {
  if (selected === checkType.UNCHECKED || !selected) {
    return images.checkbox_unselected;
  } else if (selected === checkType.CHECKED) {
    return images.checkbox_selected;
  } else {
    return images.checkbox_partial;
  }
};
const logTree = (node: TagNode, level = 0): void => {
  const indent = " ".repeat(level * 2);
  console.log(`${indent}${node.titleWithCount} (${node.selected})`);
  if (node.children) {
    node.children.forEach((child) => {
      logTree(child, level + 1);
    });
  }
};
const getParentNode = (
  nodes: TagNode[],
  childNode: TagNode
): TagNode | undefined => {
  // If the child node is the root node, return undefined
  if (childNode === nodes[0]) {
    return undefined;
  }

  // Traverse up the tree to find the parent node
  const findParent = (
    parentNode: TagNode,
    searchNode: TagNode
  ): TagNode | undefined => {
    if (parentNode.children && parentNode.children.includes(searchNode)) {
      return parentNode;
    } else {
      for (const child of parentNode.children || []) {
        const result = findParent(child, searchNode);
        if (result) {
          return result;
        }
      }
    }
    return undefined;
  };

  // Call the recursive function to find the parent node
  return findParent(nodes[0], childNode);
};
const toggleChecked = (selected: string): string => {
  if (selected === checkType.CHECKED) return checkType.UNCHECKED;
  else return checkType.CHECKED;
};
export {
  getCheckboxImage,
  hasChildren,
  checkType,
  getParentNode,
  toggleChecked,
};
