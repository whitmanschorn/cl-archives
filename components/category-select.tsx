import { useRouter } from "next/router";

export default function Categories({ categories, currentValue = "" }) {
  const router = useRouter();
  const handleChangeCategory = (e) => {
    router.push(`/categories/${e.target.value}`);
  };

  if (!(categories && categories.nodes && categories.nodes.length > 0)) {
    return <></>;
  }
  return (
    <span className="bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">
      <select defaultValue={currentValue} onChange={handleChangeCategory}>
        {categories.nodes.map((category) => (
          <option key={category.slug} value={category.slug} className="ml-1">
            {category.name}
          </option>
        ))}
      </select>
    </span>
  );
}
