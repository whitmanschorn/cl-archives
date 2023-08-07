export default function PostTitle({ children }) {
  return (
    <h1
      className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight md:leading-none mb-12 text-center md:text-left mt-12"
      dangerouslySetInnerHTML={{ __html: children }}
    />
  )
}
