"use client";

import { useFormStatus } from "react-dom";
import { deleteCategory } from "@/actions/categories/delete-category";

type Props = {
  categoryId: string;
};

function SubmitButton() {

  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400 hover:bg-red-500/30 disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );

}

export default function DeleteCategoryButton({
  categoryId,
}: Props) {

  return (

    <form
      action={deleteCategory}
      onSubmit={(e) => {

        if (!window.confirm("Delete this category?")) {
          e.preventDefault();
        }

      }}
    >

      <input
        type="hidden"
        name="id"
        value={categoryId}
      />

      <SubmitButton />

    </form>

  );

}