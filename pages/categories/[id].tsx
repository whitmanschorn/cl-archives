import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import Button from "../../components/button";
import Container from "../../components/container";
import PostBody from "../../components/post-body";
import MoreStories from "../../components/more-stories";
import Header from "../../components/header";
import PostHeader from "../../components/post-header";
import SectionSeparator from "../../components/section-separator";
import Layout from "../../components/layout";
import PostTitle from "../../components/post-title";
import PostComments from "../../components/post-comments";
import Tags from "../../components/tags";
import Spinner from "../../components/spinner";
import { searchPostsByCategory, getCategoriesWithSlug } from "../../lib/api";
import { CMS_NAME } from "../../lib/constants";
import { useState, useEffect } from "react";
import CategorySelect from "../../components/category-select";

export default function CategoryPage({ id, data, categories }) {
  const router = useRouter();

  const [postList, setPostList] = useState(data);
  const [isLoading, setIsLoading] = useState(false);

  if (!router.isFallback && !postList) {
    return <ErrorPage statusCode={404} />;
  }

  if (!(postList && postList.length > 0)) {
    <Layout preview={false}>Loading...</Layout>;
  }

  const fetchSearchResults = async (cursor, isBefore = false) => {
    setIsLoading(true);
    const updatedPosts = await searchPostsByCategory(id, cursor, isBefore);
    setPostList(updatedPosts);
    setIsLoading(false);
  };

  const onSubmitSearch = async (e) => {
    e.preventDefault();
    const queryInputValue = e.target.query.value;
    setQuery(queryInputValue);
    fetchSearchResults("", false);
  };

  const { hasNextPage, hasPreviousPage, startCursor, endCursor } =
    postList.posts.pageInfo;

  const handleClickNext = (e) => {
    e.preventDefault();
    fetchSearchResults(endCursor, false);
  };

  const handleClickPrevious = (e) => {
    e.preventDefault();
    fetchSearchResults(startCursor, true);
  };

  useEffect(() => {
    setPostList(data);
  }, [id, data]);

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

            <CategorySelect currentValue={id} categories={categories} />
            <br/>
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
              {!isLoading && hasPreviousPage && (
                <Button onClick={handleClickPrevious}>Previous</Button>
              )}
              {!isLoading && hasNextPage && (
                <Button onClick={handleClickNext}>Next</Button>
              )}
            </ul>
          </>
        )}
        <br />
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const categories = await getCategoriesWithSlug();

  const data = await searchPostsByCategory(params.id);
  return {
    props: {
      id: params.id,
      data,
      categories,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const categories = await getCategoriesWithSlug();

  return {
    paths: categories.nodes.map(({ slug }) => `/categories/${slug}`) || [],
    fallback: false,
  };
};
