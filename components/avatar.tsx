import Image from 'next/image'

export default function Avatar({ author }) {
  const isAuthorHaveFullName = author?.node?.firstName && author?.node?.lastName
  let name = null

  if(isAuthorHaveFullName) {
    name = `${author.node.firstName} ${author.node.lastName}`
    } else {
      if(author.node){
      name = author.node.name

      }
  }
  return (
    <div className="flex items-center">
      <div className="text-xl font-bold">{name}</div>
    </div>
  )
}
