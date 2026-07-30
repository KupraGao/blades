"use client";

import { useFormStatus } from "react-dom";
import { deleteProduct } from "@/actions/products/delete-product";

type Props={
  productId:string;
};

function SubmitButton(){

  const{pending}=useFormStatus();

  return(

    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/30 disabled:opacity-50"
    >
      {pending?"Deleting...":"Delete"}
    </button>

  );

}

export default function DeleteProductButton({
  productId,
}:Props){

  return(

    <form
      action={deleteProduct}
      onSubmit={(event)=>{

        if(!window.confirm("Delete this product?")){
          event.preventDefault();
        }

      }}
    >

      <input
        type="hidden"
        name="id"
        value={productId}
      />

      <SubmitButton/>

    </form>

  );

}