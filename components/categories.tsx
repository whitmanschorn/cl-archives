export default function Categories({ categories }) {
  const finalName = categories?.edges?.node?.name || ''
  return (
    <span className="ml-1">
      under
      {categories.edges.length > 0 ? (
        categories.edges.map((category, index) => (
          <span key={index} className="ml-1">
            {category.node.name}
          </span>
        ))
      ) : (
        <span className="ml-1">{finalName}</span>
      )}
    </span>
  )
}
