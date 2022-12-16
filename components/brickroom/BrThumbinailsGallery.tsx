import { useState } from "react";
// Import Swiper React components
import { Navigation, Thumbs } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

// import required modules

const BrThumbinailsGallery = ({ images }: { images: string[] | undefined }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

  // Empty state
  if (!images || images.length === 0)
    return (
      <div className="h-96 rounded-lg overflow-hidden">
        <div className="h-full bg-gray-300 flex flex-col items-center justify-center">
          <p className="text-gray-500">{"No images found"}</p>
        </div>
      </div>
    );

  return (
    <>
      <div className="h-96 rounded-lg overflow-hidden">
        {/* Single image */}
        {images.length === 1 && <img className="w-full h-full fit  rounded-xl object-contain" src={images[0]} alt="" />}

        {/* Multiple images */}
        {images.length > 1 && (
          <>
            <Swiper
              modules={[Navigation, Thumbs]}
              onSlideChange={() => console.log("slide change")}
              navigation
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <img src={image} alt="" />
                </SwiperSlide>
              ))}
            </Swiper>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-4">
          <Swiper
            onSwiper={setThumbsSwiper}
            slidesPerView={4}
            watchSlidesProgress={true}
            modules={[Navigation, Thumbs]}
            className="mySwiper"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <img src={image} alt="" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </>
  );
};

export default BrThumbinailsGallery;
