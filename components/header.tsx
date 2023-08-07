import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
<header class="header sticky top-0 bg-white shadow-md flex items-center justify-between px-8 py-02">
    <h1 class="w-3/12">
        <a href="/">
          <Image 
          width={500}
          height={500}
          src='https://www.chumplady.com/wp-content/uploads/2022/03/logo.png' alt="Chump Lady logo"/>
        </a>
    </h1>

    <nav class="nav font-semibold text-lg">
        <ul class="flex items-center">
            <li class="p-4 border-b-2 border-green-500 border-opacity-0 hover:border-opacity-100 hover:text-green-500 duration-200 cursor-pointer active">
              <a href="/search">Search</a>
            </li>
            <li class="p-4 border-b-2 border-green-500 border-opacity-0 hover:border-opacity-100 hover:text-green-500 duration-200 cursor-pointer">
              <a href="http://chumplady.com">Home</a>
            </li>
        </ul>
    </nav>
</header>
  )
}
