import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client'
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}



export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>
  }

  const wordCount = post.data.content.reduce((acc, content) => {
    acc += content.heading.split(' ').length;
    acc += RichText.asText(content.body).split(' ').length;
    return acc;
  }, 0)

  return (
    <>
      <Header />
      <img className={styles.imgBanner} src={post.data.banner.url} alt="" />
      <article className={styles.container}>
        <p>{post.data.title}</p>
        <div className={styles.container_heading}>
          <div>
            <FiCalendar size={20} />
            <p>{format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              {
                locale: ptBR,
              }
            )}</p>
          </div>
          <div>
            <FiUser size={20} />
            <p>{post.data.author}</p>
          </div>
          <div>
            <FiClock size={20} />
            <p>{Math.ceil(wordCount / 200)} min</p>
          </div>
        </div>

        {post.data.content.map((content, index) => (
          <div key={index}>
            <h1>{content.heading}</h1>
            {content.body.map((item, index) => (
              <p key={index}>{item.text}</p>
            ))}
          </div>
        ))}
      </article>
    </>
  )
}


export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title'],
    }
  );

  return {
    paths: posts.results.map(post => {
        return {
          params: {
            slug: post.uid
          }
        }
    }),
    fallback: true
  }
};

export const getStaticProps = async context => {
  const { params } = context;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(params.slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      subtitle: response.data.subtitle,
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  }

  return {
    props: { post },
    redirect: 60 * 30, //30 minutes
  };
};
