import Avatar from './avatar'
import Date from './date'
import CoverImage from './cover-image'
import PostTitle from './post-title'
import Categories from './categories'

export default function PostHeader({
  title,
  coverImage,
  date,
  author,
  categories,
}) {
  return (
    <>
      <PostTitle>{title}</PostTitle>
      <div className="hidden md:block md:mb-12">
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-lg">
          <Avatar author={author} />
          <Date dateString={date} />
          <Categories categories={categories} />
        </div>
      </div>
    </>
  )
}
