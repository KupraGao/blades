"use server";

import { createClient } from "@/lib/supabase/server";

export async function createProduct(
  formData: FormData
) {

  // =================================================
  // SUPABASE
  // =================================================

  const supabase =
    await createClient();


  // =================================================
  // FORM VALUES
  // =================================================

  const title =
    formData.get("title");

  const price =
    formData.get("price");

  const stock =
    formData.get("stock");

  const description =
    formData.get("description");

  const bladeSteel =
  formData.get("bladeSteel");

const bladeThickness =
  formData.get("bladeThickness");

const bladeLength =
  formData.get("bladeLength");

const handleMaterial =
  formData.get("handleMaterial");

const lockingType =
  formData.get("lockingType");

const knifeType =
  formData.get("knifeType");

const bladeFinish =
  formData.get("bladeFinish");

const country =
  formData.get("country");

const weight =
  formData.get("weight");

const overallLength =
  formData.get("overallLength");
  // =================================================
  // MAIN IMAGE
  // =================================================

  const mainImage =
    formData.get("mainImage") as File;


  // =================================================
  // GALLERY IMAGES
  // =================================================

  const galleryImages =
    formData.getAll(
      "galleryImages"
    ) as File[];


  // =================================================
  // IMAGE NAME
  // =================================================

  const fileName =
    `${Date.now()}-${mainImage.name}`;


  // =================================================
  // STORAGE UPLOAD
  // =================================================

  const {
    data: imageData,
    error: imageError,
  } = await supabase.storage
    .from("product-images")
    .upload(
      fileName,
      mainImage
    );


  // =================================================
  // IMAGE ERROR
  // =================================================

  if (imageError) {

    console.log(
      "IMAGE ERROR:",
      imageError
    );

    return;

  }


  // =================================================
  // PUBLIC URL
  // =================================================

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("product-images")
    .getPublicUrl(
      fileName
    );


  // =================================================
  // PRODUCT INSERT
  // =================================================

  const { data, error } =
    await supabase
      .from("products")
      .insert([
        {
  title,
  price,
  stock,
  description,

  blade_steel: bladeSteel,
  blade_thickness: bladeThickness,
  blade_length: bladeLength,
  handle_material: handleMaterial,
  locking_type: lockingType,
  knife_type: knifeType,
  blade_finish: bladeFinish,
  country,
  weight,
  overall_length: overallLength,
},
      ])
      .select();


  // =================================================
  // INSERT ERROR
  // =================================================

  if (error) {

    console.log(
      "ERROR:",
      error
    );

    return;

  }


  // =================================================
  // PRODUCT ID
  // =================================================

  const productId =
    data[0].id;


  // =================================================
  // MAIN IMAGE INSERT
  // =================================================

  const {
    error: imageInsertError,
  } = await supabase
    .from("product_images")
    .insert([
      {
        product_id: productId,
        image_url: publicUrl,
        is_main: true,
      },
    ]);


  // =================================================
  // IMAGE INSERT ERROR
  // =================================================

  if (imageInsertError) {

    console.log(
      "IMAGE INSERT ERROR:",
      imageInsertError
    );

    return;

  }


  // =================================================
  // GALLERY LOOP
  // =================================================

  for (const image of galleryImages) {

    // empty file skip

    if (!image.name) continue;


    // =================================================
    // FILE NAME
    // =================================================

    const galleryFileName =
      `${Date.now()}-${image.name}`;


    // =================================================
    // IMAGE UPLOAD
    // =================================================

    const {
      error: galleryUploadError,
    } = await supabase.storage
      .from("product-images")
      .upload(
        galleryFileName,
        image
      );


    // =================================================
    // UPLOAD ERROR
    // =================================================

    if (galleryUploadError) {

      console.log(
        "GALLERY ERROR:",
        galleryUploadError
      );

      continue;

    }


    // =================================================
    // PUBLIC URL
    // =================================================

    const {
      data: {
        publicUrl: galleryUrl,
      },
    } = supabase.storage
      .from("product-images")
      .getPublicUrl(
        galleryFileName
      );


    // =================================================
    // IMAGE INSERT
    // =================================================

    await supabase
      .from("product_images")
      .insert([
        {
          product_id: productId,
          image_url: galleryUrl,
          is_main: false,
        },
      ]);

  }


  // =================================================
  // SUCCESS
  // =================================================

  console.log(
    "PRODUCT CREATED"
  );

}