import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
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
  console.log(JSON.stringify(post.data.content, null, 2))
  return (
    <>
    <Header />
      <img className={styles.imgBanner} src={post.data.banner.url} alt="" />
    <article className={styles.container}>      
      <p>{post.data.title}</p>
      <div  className={styles.container_heading}>
        <div>
          <FiCalendar size={20} />
          <p>{post.first_publication_date}</p>
        </div>
        <div>
          <FiUser size={20} />
          <p>{post.data.author}</p>
        </div>
        <div>
          <FiClock size={20} />
          <p>Tempo</p>
        </div>
      </div>

      {post.data.content.map(content => (
        <div key={content.heading}>
          <h1>{content.heading}</h1>
          {content.body.map(item => (
            <p>{item.text}</p>
          ))}
        </div>
      ))}
    </article>
    </>
  )
}

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);

//   // TODO
// };

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps = async context => {
  const { params } = context;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(params.slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
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
