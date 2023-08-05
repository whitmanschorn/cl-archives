import styles from './post-comment.module.css'
import React, { useState } from 'react';

const Comment = ({ content, author, date, id, parentId, replies, ...otherProps }) => {
        return (<div 
          key={id}
                className={styles.comment}
          >
          <div 
                className={styles.byline}
          >
            {author?.node?.name} at {date}
          </div>
          <div
                className={styles.content}
                dangerouslySetInnerHTML={{ __html: content }}
              />
                

              <div>
                {replies.length > 0 && <h4>Replies</h4>}
                <div>{replies.map(replyItem => (<Comment {...replyItem}></Comment>))}</div>
              </div>

              </div>)
      }
   


const recursiveDefineComments = (commentList, currentComment = null, currentDepth = 0) => {


  let relevantComments = [];

  // case: handle root node comments
  if(!currentComment){
    // should have no parent ID
    relevantComments = commentList.filter(item => !item.parentId)
  } else {
    relevantComments = commentList.filter(item => item.parentId === currentComment.id)

  }

  relevantComments.forEach(item => item.replies = recursiveDefineComments(commentList, item, currentDepth + 1))

  return relevantComments
}

const PAGINATION_LIMIT = 100;
export default function PostComments({ post }) {
  const initialComments = post?.comments?.nodes || [];
  const initialHasMoreComments = initialComments.length === PAGINATION_LIMIT
  // console.log(post);

  const [comments, setComments] = useState(initialComments)
  const [hasMoreComments, setHasMoreComments] = useState(initialHasMoreComments)

  let commentTree = recursiveDefineComments(comments)



  return (
    <div>
    <h1>Comments</h1>
    <div>
<div>
      {commentTree.map(item => <Comment {...item} />)}
         <div>{hasMoreComments && <button>More Comments</button>}</div>
      </div>
    </div>
    </div>
  )
}
