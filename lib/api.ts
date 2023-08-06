const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

async function fetchAPI(query = "", { variables }: Record<string, any> = {}) {
  const headers = { "Content-Type": "application/json" };

  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers[
      "Authorization"
    ] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`;
  }

  // WPGraphQL Plugin must be enabled
  const res = await fetch(API_URL, {
    headers,
    method: "POST",
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await res.json();
  if (json.errors) {
    console.error(json.errors);
    throw new Error("Failed to fetch API");
  }
  return json.data;
}

export async function getPreviewPost(id, idType = "DATABASE_ID") {
  const data = await fetchAPI(
    `
    query PreviewPost($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        databaseId
        slug
        status
      }
    }`,
    {
      variables: { id, idType },
    },
  );
  return data.post;
}

export async function searchPosts(
  searchString = "",
  currentCursor = "",
  isBefore = false,
) {
  let data;
  if (isBefore) {
    data = await fetchAPI(
      `
      query SearchPosts($searchString: String!, $currentCursor: String!) {
        posts(last: 20, before: $currentCursor, where: { search: $searchString }) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
          }
          edges {
            node {
              slug
              title
              date
            }
            cursor
          }
        }
      }
      `,
      {
        variables: { searchString, currentCursor },
      },
    );
  } else {
    data = await fetchAPI(
      `
      query SearchPosts($searchString: String!, $currentCursor: String!) {
        posts(first: 20, after: $currentCursor, where: { search: $searchString }) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
          }
          edges {
            node {
              slug
              title
              date
            }
            cursor
          }
        }
      }
      `,
      {
        variables: { searchString, currentCursor },
      },
    );
  }

  return data;
}

export async function searchPostsByCategory(
  slug = "",
  currentCursor = "",
  isBefore = false,
) {
  let data;
  if (isBefore) {
    data = await fetchAPI(
      `
      query GetCategoryPostsBySlug($currentCursor: String!, $slug: [String]) {
  categories(where: {slug: $slug}) {
    edges {
      node {
        posts(last: 10, before: $currentCursor) {          
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
          }
          edges {
            node {
              id
              slug
              title
              date
            }
          }
        }
      }
    }
  }
}
      `,
      {
        variables: { slug: [slug], currentCursor },
      },
    );
  } else {
    data = await fetchAPI(
      `
      query GetCategoryPostsBySlug($currentCursor: String!, $slug: [String]) {
  categories(where: {slug: $slug}) {
    edges {
      node {
        posts(first: 10, after: $currentCursor) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
          }
          edges {
            node {
              id
              slug
              title
              date
            }
          }
        }
      }
    }
  }
}
      `,
      {
        variables: { slug: [slug], currentCursor },
      },
    );
  }
  return data.categories.edges[0].node;
}

export async function getAllPostsWithSlug() {
  // if we have more results, we need to know!

  let hasMore = true;
  let cursorString = "";
  const results = { edges: [] };

  while (hasMore) {
    let data;
    if (cursorString) {
      data = await fetchAPI(
        `
        query AllPostsWithSlug($cursorString: String!) {
          posts(first: 10000, last: null, after: $cursorString, before: null) {
            edges {
              node {
                slug
                title
                date
              }
              cursor
            }
          }
        }
      `,
        {
          variables: { cursorString },
        },
      );
    } else {
      data = await fetchAPI(`
        {
          posts(first: 10000) {
            edges {
              node {
                slug
                title
                date
              }
              cursor
            }
          }
        }
      `);
    }

    const PAGINATION_LIMIT = 100;
    const edges = data.posts.edges;
    if (edges.length === PAGINATION_LIMIT) {
      // grab our cursor and repeat
      cursorString = edges[PAGINATION_LIMIT - 1].cursor;
      results.edges = results.edges.concat(edges);

      if (process.env.NODE_ENV === "development") {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  return results;
}

export async function getCategoriesWithSlug() {
  const data = await fetchAPI(`
    query getCategoryNodes {
      categories(first: 100) {
          nodes {
            id
            name
            slug
          }
        }
      }
  `);

  return data.categories;
}

export async function getAllPostsForHome(preview) {
  const data = await fetchAPI(
    `
    query AllPosts {
      posts(first: 20, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            title
            excerpt
            slug
            date
            featuredImage {
              node {
                sourceUrl
              }
            }
            author {
              node {
                name
                firstName
                lastName
                avatar {
                  url
                }
              }
            }
          }
        }
      }
    }
  `,
    {
      variables: {
        onlyEnabled: !preview,
        preview,
      },
    },
  );

  return data?.posts;
}

export async function getMoreComments(slug, cursorString) {
  let currentCursor = cursorString;
  let hasMore = true;

  const data = await fetchAPI(
    `
    query PostCommentsBySlug($id: ID!, $idType: PostIdType!, $currentCursor: String!) {
      post(id: $id, idType: $idType) {
        comments(first: 100, last: null, after: $currentCursor, before: null, where: { orderby: COMMENT_DATE }) {
          pageInfo {
            hasNextPage
            endCursor
          }
        nodes {
          author {
            node {
               name
            }
          }
          date
          id
          content
          parentId
        }
      }
    }
  }
  `,
    {
      variables: {
        id: slug,
        idType: "SLUG",
        currentCursor,
      },
    },
  );

  const dataComments = data.post.comments;
  const postComments = dataComments.nodes;
  return { pageInfo: dataComments.pageInfo, comments: postComments };
}

export async function getPostAndMorePosts(slug, preview, previewData) {
  const postPreview = preview && previewData?.post;
  // The slug may be the id of an unpublished post
  const isId = Number.isInteger(Number(slug));
  const isSamePost = isId
    ? Number(slug) === postPreview.id
    : slug === postPreview.slug;
  const isDraft = isSamePost && postPreview?.status === "draft";
  const isRevision = isSamePost && postPreview?.status === "publish";
  const data = await fetchAPI(
    `
    fragment AuthorFields on User {
      name
      firstName
      lastName
      avatar {
        url
      }
    }
    fragment PostFields on Post {
      title
      excerpt
      slug
      date
      featuredImage {
        node {
          sourceUrl
        }
      }
      author {
        node {
          ...AuthorFields
        }
      }
      comments(first: 100, where: { orderby: COMMENT_DATE }) {
       pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          author {
            node {
               name
            }
          }
          date
          id
          content
          parentId
        }
    }
      categories {
        edges {
          node {
            name
            slug
          }
        }
      }
      tags {
        edges {
          node {
            name
          }
        }
      }
    }
    query PostBySlug($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        ...PostFields
        content
        ${
          // Only some of the fields of a revision are considered as there are some inconsistencies
          isRevision
            ? `
        revisions(first: 1, where: { orderby: { field: MODIFIED, order: DESC } }) {
          edges {
            node {
              title
              excerpt
              content
              author {
                node {
                  ...AuthorFields
                }
              }
            }
          }
        }
        `
            : ""
        }
      }
      posts(first: 3, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            ...PostFields
          }
        }
      }
    }
  `,
    {
      variables: {
        id: isDraft ? postPreview.id : slug,
        idType: isDraft ? "DATABASE_ID" : "SLUG",
      },
    },
  );

  // Draft posts may not have an slug
  if (isDraft) data.post.slug = postPreview.id;
  // Apply a revision (changes in a published post)
  if (isRevision && data.post.revisions) {
    const revision = data.post.revisions.edges[0]?.node;

    if (revision) Object.assign(data.post, revision);
    delete data.post.revisions;
  }

  // Filter out the main post
  data.posts.edges = data.posts.edges.filter(({ node }) => node.slug !== slug);
  // If there are still 3 posts, remove the last one
  if (data.posts.edges.length > 2) data.posts.edges.pop();

  return data;
}
