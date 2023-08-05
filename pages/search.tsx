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
import { getAllPostsWithSlug, getPostAndMorePosts } from "../lib/api";
import { CMS_NAME } from "../lib/constants";

export default function Post({ allPosts }) {
  const router = useRouter();

  if (!router.isFallback && !allPosts) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <Layout>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <Head>
              <title>Chump Lady Archives</title>
              <h3>{allPosts.length} entries</h3>
            </Head>
            <ul>
              {allPosts.edges.map((item) => {
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
        <br/>
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({}) => {
  const allPosts = await getAllPostsWithSlug();

  return {
    props: {
      allPosts,
    },
    revalidate: 10,
  };
};
