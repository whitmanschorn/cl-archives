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
      <div key="author" className={styles.byline}>
        {author?.node?.name} at {date}
      </div>
      <div
        key="content"
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <div key="replies">
        {replies.length > 0 && <h4>Replies</h4>}
        <div>
          {replies.map((replyItem) => (
            <Comment key={replyItem.id} {...replyItem}></Comment>
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

  relevantComments.forEach(
    (item) => (item.replies = recursiveDefineComments(commentList, item)),
  );

  return relevantComments;
};

export default function PostComments({ post }) {
  const initialComments = post?.comments?.nodes || [];
  const initialHasMoreComments = post.comments.pageInfo.hasNextPage;
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [cursor, setCursor] = useState(post?.comments?.pageInfo?.endCursor);

  const [hasMoreComments, setHasMoreComments] = useState(
    initialHasMoreComments,
  );

  const handleClickMore = async (e) => {
    e.preventDefault();
    setHasMoreComments(false);
    setIsLoading(true);
    const data = await getMoreComments(post.slug, cursor);
    const allComments = comments.concat(data.comments);
    setComments(allComments);
    setCursor(data.pageInfo.endCursor);
    setIsLoading(false);
    setHasMoreComments(data.pageInfo.hasNextPage);
  };
  let commentTree = recursiveDefineComments(comments);
  return (
    <div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold ">Comments</h1>
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
            {isLoading && <div>Loading more ...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
