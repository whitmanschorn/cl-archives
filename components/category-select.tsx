import { useRouter } from "next/router";

export default function Categories({ categories }) {
  const router = useRouter();
  const handleChangeCategory = (e) => {
    console.log('!!!handleChangeCategory', e.target.value);
    router.push(`/categories/${e.target.value}`);
    // router.refresh()
  };

  if (!(categories && categories.nodes && categories.nodes.length > 0)) {
    return <></>;
  }

  return (
    <span className="ml-1">
      <select onChange={handleChangeCategory}>
        {categories.nodes.map((category) => (
          <option key={category.slug} value={category.slug} className="ml-1">
            {category.name}
          </option>
        ))}
      </select>
    </span>
  );
}
