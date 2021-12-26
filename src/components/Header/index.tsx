import styles from "./header.module.scss";
import Link from "next/link";

export default function Header() {
  return (
    <header className={styles.container} >
      <Link href="/">
        <img className={styles.logo} src="/Logo.svg" alt="logo" />
      </Link>
    </header >
  )
}
