import { ProductInput } from "@/types/product.types";

export function validateProduct(product:ProductInput){

  if(!product.title)
    throw new Error("პროდუქტის დასახელება აუცილებელია.");

  if(product.title.length<2)
    throw new Error("დასახელება მინიმუმ 2 სიმბოლო უნდა იყოს.");

  if(!Number.isFinite(product.price)||product.price<=0)
    throw new Error("ფასი არასწორია.");

  if(!Number.isInteger(product.stock)||product.stock<0)
    throw new Error("მარაგი არასწორია.");

  if(
    product.brandId!==null&&
    (!Number.isInteger(product.brandId)||product.brandId<=0)
  )
    throw new Error("ბრენდი არასწორია.");

  // =========================================
  // CATEGORIES
  // =========================================

  if(product.categories.length===0)
    throw new Error("აირჩიეთ მინიმუმ ერთი კატეგორია.");

  const uuidRegex=
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if(
    product.categories.some(
      id=>!uuidRegex.test(id)
    )
  ){
    throw new Error("კატეგორია არასწორია.");
  }

  // =========================================
  // REVIEW LINK
  // =========================================

  if(product.reviewLink){
    try{
      new URL(product.reviewLink);
    }catch{
      throw new Error("ლინკი არასწორია.");
    }
  }

}