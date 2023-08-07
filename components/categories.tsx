export default function Categories({ categories }) {
  const finalName = categories?.edges?.node?.name || ''
  return (
    <div className="ml-1">
      {categories.edges.length > 0 ? (
        categories.edges.map((category, index) => (
          <a href={`/categories/${category.node.slug}`} key={index} className="rounded-full mr-2 text-xs font-bold text-white bg-blue-500 py-1 px-2">
            <button>{category.node.name}</button>
          </a>
        ))
      ) : (
        <span className="ml-1">{finalName}</span>
      )}
    </div>
  )
}
