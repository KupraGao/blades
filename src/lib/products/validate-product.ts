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

  if(
    product.categories.some(
      id=>!Number.isInteger(id)||id<=0
    )
  )
    throw new Error("კატეგორია არასწორია.");

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