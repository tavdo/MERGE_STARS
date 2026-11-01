// Reviewed duplicate artwork. Legacy asset URLs stay available for saved links.
export const duplicatePhotoAliases:Readonly<Record<string,string>>={
 '/museum-v78/assets/founder-brand-megapolis.png':'/museum-v78/assets/founder-megapolis-2026-10-16.png',
 '/museum-v78/assets/founder-futuristic-museum.png':'/museum-v78/assets/founder-megapolis-2026-10-16.png',
 '/museum-v78/assets/founder-atrium-fashion.png':'/museum-v78/assets/founder-grand-museum-interior.png',
 '/museum-v78/assets/vip-grand-museum.png':'/museum-v78/assets/approved-mega-museum.png',
};
export function canonicalPhotoPath(image:string):string{return duplicatePhotoAliases[image]??image;}
export function uniquePhotographs<T extends {image:string}>(items:readonly T[]):T[]{
 const chosen=new Map<string,T>();
 for(const item of items){const image=canonicalPhotoPath(item.image),previous=chosen.get(image);if(!previous||previous.image!==image&&item.image===image)chosen.set(image,item);}
 return [...chosen].map(([image,item])=>item.image===image?item:{...item,image});
}
