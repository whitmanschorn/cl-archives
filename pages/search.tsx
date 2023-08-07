import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import Button from "../components/button";
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
import CategorySelect from "../components/category-select";
import Spinner from "../components/spinner";
import { searchPosts, getCategoriesWithSlug } from "../lib/api";
import { CMS_NAME } from "../lib/constants";
import { useState } from "react";

export default function SearchPage({ allPosts, categories }) {
  const router = useRouter();

  const [postList, setPostList] = useState(allPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState(router.query.q || "");

  if (!router.isFallback && !allPosts) {
    return <ErrorPage statusCode={404} />;
  }

  if (!(allPosts && allPosts.length > 0)) {
    <Layout preview={false}>Loading...</Layout>;
  }

  const fetchSearchResults = async (query, cursor, isBefore = false) => {
    setIsLoading(true);
    const updatedPosts = await searchPosts(query, cursor, isBefore);
    setPostList(updatedPosts);
    setIsLoading(false);
  };

  const onSubmitSearch = async (e) => {
    e.preventDefault();
    const queryInputValue = e.target.query.value;
    setQuery(queryInputValue);
    fetchSearchResults(queryInputValue, "", false);
  };

  const { hasNextPage, hasPreviousPage, startCursor, endCursor } =
    postList?.posts.pageInfo;

  const handleClickNext = (e) => {
    e.preventDefault();
    fetchSearchResults(query, endCursor, false);
  };

  const handleClickPrevious = (e) => {
    e.preventDefault();
    fetchSearchResults(query, startCursor, true);
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

            <CategorySelect categories={categories} />
            <form onSubmit={onSubmitSearch}>
              <input
                name="query"
                id="query"
                type="text"
                className={
                  "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                }
              />
            </form>

            {isLoading && <Spinner />}
            <br />
            <ul>
              {!isLoading &&
                postList.posts.edges.map((item) => {
                  const { title, slug, date } = item.node;
                  const dateString = new Date(date).toLocaleDateString(
                    "en-us",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  );
                  return (
                    <li key={slug}>
                      <a href={`/posts/${slug}`}>
                        {title} - {dateString}
                      </a>
                    </li>
                  );
                })}
        <br />
              {!isLoading && hasPreviousPage && <Button onClick={handleClickPrevious}>Previous</Button>}
              {!isLoading && hasNextPage && <Button onClick={handleClickNext}>Next</Button>}
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
  const categories = await getCategoriesWithSlug();
  return {
    props: {
      allPosts,
      categories
    },
    revalidate: 10,
  };
};
