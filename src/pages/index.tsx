import { GetStaticProps } from 'next';
import Head from 'next/head'
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from "react-icons/fi";
import Prismic from '@prismicio/client'
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [availableposts, setAvailableposts] = useState(postsPagination.results);
  const [currentNextPage, setCurrentNextPage] = useState(postsPagination.next_page);

  async function handleLoadPosts() {
    const response = await fetch(currentNextPage);
    const newData = await response.json();
    const newPosts: Post[] = newData.results.map(result => {
      return {
        uid: result.uid,
        first_publication_date: result.first_publication_date,
        data: {
          title: result.data.title,
          subtitle: result.data.subtitle,
          author: result.data.author,
        }
      }
    })

    setCurrentNextPage(newData.next_page);
    setAvailableposts([...availableposts, ...newPosts]);
  }

  return (
    <div className={commonStyles.container}>
      <Head>
        <title>Home | Blog</title>
      </Head>
      <header className={styles.logo}>
        <img src="Logo.svg" alt="logo" />
      </header >
      <main className={styles.posts}>
        {availableposts.map(post => (
          <Link key={post.uid} href={`post/${post.uid}`}>
            <a>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div>
                <FiCalendar size={20} /><time>{format(
                  new Date(post.first_publication_date),
                  'dd MMM yyyy',
                  {
                    locale: ptBR,
                  }
                )}</time>
                <FiUser size={20} /><p>{post.data.author}</p>
              </div>
            </a>
          </Link>
        ))
        }
        {!!(currentNextPage) && (<button onClick={handleLoadPosts} type="button"
        >Carregar mais posts</button>)}
      </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author', 'posts.banner', 'posts.content'],
      pageSize: 2,
    }
  );

  const { next_page } = postsResponse

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  });

  return {
    props: { postsPagination: { next_page, results: posts } }
  }
};
