import styles from "./post-comment.module.css";
import React, { useState } from "react";

import { getMoreComments } from "../lib/api";

const Comment = ({
  content,
  author,
  date,
  id,
  parentId,
  replies,
  ...otherProps
}) => {
  return (
    <div key={id} className={styles.comment}>
      <div className={styles.byline}>
        {author?.node?.name} at {date}
      </div>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <div>
        {replies.length > 0 && <h4>Replies</h4>}
        <div>
          {replies.map((replyItem) => (
            <Comment {...replyItem}></Comment>
          ))}
        </div>
      </div>
    </div>
  );
};

const recursiveDefineComments = (commentList, currentComment = null) => {
  let relevantComments = [];

  // case: handle root node comments
  if (!currentComment) {
    // should have no parent ID
    relevantComments = commentList.filter((item) => !item.parentId);
  } else {
    relevantComments = commentList.filter(
      (item) => item.parentId === currentComment.id,
    );
  }
  if(relevantComments.length > 0){
    console.log('relevantComments', relevantComments, currentComment, commentList);
  }
  relevantComments.forEach(
    (item) => (item.replies = recursiveDefineComments(commentList, item)),
  );

  return relevantComments;
};

export default function PostComments({ post }) {
  const initialComments = post?.comments?.nodes || [];
  const initialHasMoreComments = post.comments.pageInfo.hasNextPage;
  const [comments, setComments] = useState(initialComments);
  const [cursor, setCursor] = useState(post?.comments?.pageInfo?.endCursor);

  const [hasMoreComments, setHasMoreComments] = useState(
    initialHasMoreComments,
  );

  const handleClickMore = async (e) => {
    e.preventDefault();
    const data = await getMoreComments(post.slug, cursor);
    const foo = comments.concat(data.comments)
    console.log('???', foo, cursor);
    setComments(foo);
    setCursor(data.pageInfo.endCursor);
    setHasMoreComments(data.pageInfo.hasNextPage);
  };
  let commentTree = recursiveDefineComments(comments);
  console.log({ commentTree, comments });
  return (
    <div>
      <h1>Comments</h1>
      <div>
        <div>
          {commentTree.map((item) => (
            <div key={item.id} className={styles.container}>
              <Comment {...item} />
            </div>
          ))}
          <div>
            {hasMoreComments && (
              <button onClick={handleClickMore}>More Comments</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
