// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
      <div className="h-96 rounded-lg overflow-hidden" id="images-gallery">
        <div className="h-full bg-gray-300 flex flex-col items-center justify-center">
          <p className="text-gray-500">{"No images found"}</p>
        </div>
      </div>
    );

  return (
    <div className="max-w-3xl">
      <div className="h-96 rounded-lg overflow-hidden w-full" id="images-gallery">
        {/* Single image */}
        {images.length === 1 && <img className="w-full h-full fit rounded-xl object-contain" src={images[0]} alt="" />}

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
                  <img src={image} alt="" style={{ objectFit: "contain" }} />
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
    </div>
  );
};

export default BrThumbinailsGallery;
