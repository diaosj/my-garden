---
title: Huffman树
date: 2009-03-02 10:54:44
tags:
 - C++
 - 数据结构
description: "Archived from my original Hexo blog."
---
直观上，带权路径长度最小的二叉树应是权值大的外节点离根节点最近的扩充二叉树，这就是Huffman树。

<!-- more -->

构造思路：

1. 根据给定的n个权值，构造具有n棵扩充二叉树的森林F，每棵二叉树只有一个根节点，左右子树均为空。
2. 重复以下步骤，直到F中仅剩下一棵树为止：
	
	1. 在F中选取两棵根节点权值最小的扩充二叉树，作为左右子树构造一棵新的二叉树。置新的二叉树的根节点的权值为左右子树上根节点的权值之和。
	2. 在F中删去这两棵二叉树。
	3. 把新的二叉树加入F。

#类定义

```cpp
\#include "heap.h"
const int DefaultSize = 20;
template <class T, class E>
struct HuffmanNode {
    E data;
    HuffmanNode<T, E> *leftChild, *rightChild, *parent;
    HuffmanNode(): leftChild(NULL), rightChild(NULL), parent(NULL) {}
    HuffmanNode(E elem, HuffmanNode<T,E> *left = NULL, HuffmanNode<T, E> *right = NULL, HuffmanNode<T, E> *pr = NULL)
    : data(elem), leftChild(left), rightChild(right), parent(pr) {}
};

template <class T, class E>
class HuffmanTree {
public:
    HuffmanTree(E w[], int n);
    ~HuffmanTree() {delete Tree(root);}
protected:
    HuffmanNode<T, E> *root;
    void deleteTree(HuffmanNode<T, E> *t);
    void mergeTree(HuffmanNode<T, E>& ht1,
        HuffmanNode<T,E>& ht2,
        HuffmanNode<T,E> *&parent) {};
};
```

#构造算法

```cpp
template <class T, class E>
HuffmanTree<T,E>::HuffmanTree(E w[], int n) {
    minHeap<T,E> hp;
    HuffmanNode<T,E> *parent, &first, &second;
    HuffmanNode<T,E> *NodeList = new HuffmanNode<T,E>[n];
    
    for (int i = 0; i < n; i ++) {
        NodeList[i].data = w[i+1];
        NodeList[i].leftChild = NULL;
        NodeList[i].rightChild = NULL;
        NodeList[i].parent = NULL;
        hp.Insert(NodeList[i]);
    }
    for (i = 0; i < n-1; i ++) {
        hp.RemoveMin(first);
        hp.RemoveMin(second);
        merge(first, second, parent);
        hp.Insert(*parent);
        root = parent;
    }
};

template <class T, class E>
void HuffmanTree<T,E>::mergeTree(HuffmanNode<T,E>& bt1,
    HuffmanNode<T,E>& bt2, HuffmanNode<T,E>*& parent) {
    parent = new E;
    parent->leftChild = &bt1;
    parent->rightChild = &bt2;
    parent->data.key = bt1.root->data.key + bt2.root->data.key;
    bt1.root->parent = bt2.root->parent = parent;
};
```

#应用

##最优判定树

在等概率情形判定问题的最优判定树一定是完全树。

对于一般的判定问题，还要考虑每个对象的概率，则判定问题的最优判定树就是Huffman树，而Huffman树的加权路径长度就是最优判定树的平均判定次数。

##Huffman编码

Huffman树的加权路径长度就是相应编码的平均编码长度。而Huffman树的形态可以不唯一。