import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import Container from "../components/container";
import PostBody from "../components/post-body";
import MoreStories from "../components/more-stories";
import Header from "../components/header";
import PostHeader from "../components/post-header";
import SectionSeparator from "../components/section-separator";
import Layout from "../components/layout";
import PostTitle from "../components/post-title";
import PostComments from "../components/post-comments";
import Tags from "../components/tags";
import { searchPosts, getPostAndMorePosts } from "../lib/api";
import { CMS_NAME } from "../lib/constants";
import { useState } from "react";

export default function Post({ allPosts }) {
  const router = useRouter();

  const [query, setQuery] = useState(router.query.q);

  if (!router.isFallback && !allPosts) {
    return <ErrorPage statusCode={404} />;
  }

  if (!(allPosts && allPosts.length > 0)) {
    <Layout preview={false}>Loading...</Layout>;
  }

  const onSubmitSearch = () => {
    console.log("searchin", query);

    router.push({
      pathname: "/search",
      query: { q: query },
    });
  };

  return (
    <Layout preview={false}>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <Head>
              <title>Chump Lady Archives</title>
            </Head>
            <div>{query}</div>
            <form onSubmit={onSubmitSearch}>
              <input
                type="text"
                className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
              />
            </form>
            <ul>
              {allPosts.posts.edges.map((item) => {
                const { title, slug, date } = item.node;
                const dateString = new Date(date).toLocaleDateString("en-us", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                return (
                  <li>
                    <a href={`/posts/${slug}`}>
                      {title} - {dateString}
                    </a>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        <br />
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({}) => {
  const allPosts = await searchPosts();

  return {
    props: {
      allPosts,
    },
    revalidate: 10,
  };
};
