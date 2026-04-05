import { Config, databases, ID } from "../Appwrite";

const seedProducts = async () => {
  const products = [
    {
      productName:
        "SAMSUNG Galaxy Book5 360 Intel Core Ultra 7 Touchscreen Thin & Light Laptop (16GB, 512GB SSD, Windows 11 Home, 8GB Graphics, 15.5 inch FHD AMOLED Display, MS Office 2021, Gray, 1.46 KG)",
      description: `Optimal Performance

Powered by the Intel Core Ultra processor, the SAMSUNG Galaxy Book5 360 15.6-Inch Laptop is designed to handle AI-driven workloads with ease. So, whether you're multitasking, creating content, or working on complex tasks, this laptop ensures fast and efficient processing for seamless performance.


Versatile 360 Degree Flexibility

Designed with a 360-degree hinge, this laptop seamlessly adapts to your creative needs. So, whether you're sketching, taking notes, working, or streaming its lightweight and slim build makes it an ideal companion for work, study, and entertainment on the go.`,
      type: "Gray",
      brand: "Samsung",
      price: 79999,
      category: "Electronics",
      image:
        "https://media.croma.com/image/upload/v1741368885/Croma%20Assets/Computers%20Peripherals/Laptop/Images/314779_0_opnked.png?tr=w-400",
      images: [
        "https://media.croma.com/image/upload/v1742550132/Croma%20Assets/Computers%20Peripherals/Laptop/Images/314773_1_wjbgxw.png?tr=w-100",
        "https://media.croma.com/image/upload/v1741369006/Croma%20Assets/Computers%20Peripherals/Laptop/Images/314773_3_njt1fh.png?tr=w-100",
        "https://media.croma.com/image/upload/v1741369011/Croma%20Assets/Computers%20Peripherals/Laptop/Images/314773_4_uiinqc.png?tr=w-100",
        "https://media.croma.com/image/upload/v1741369013/Croma%20Assets/Computers%20Peripherals/Laptop/Images/314773_7_shy2hb.png?tr=w-100",
      ],
      stock: 50,
      details: "",
      currency: "SSP",
      specifications: `Display: 39.62 cms (15.5 inches), Touchscreen, FHD AMOLED
Memory: 16GB LPDDR5X RAM, 512GB NVMe SSD ROM
Processor: Intel Core Ultra 7
OS: Windows 11 Home
Graphics: Intel Arc
Included Software: MS Office Home 2021
Galaxy AI, Quick Share, Dolby Atmos
Warranty: 1 year Onsite`,
    },

    {
      productName:
        "acer AL1541 AMD Ryen 7 Thin & Light Laptop (16GB, 512GB SSD, Windows 11 15.6 inch Full HD LED Backlit Display, MS Office 2021, Steel Gray, 1.59 KG)",
      description:
        "Elevate your computing experience with the Acer AL15-41 laptop. Experience crisp and clear visuals on the 15.6-inch FHD LED-backlit display with a 60Hz refresh rate. Enjoy immersive viewing with vibrant colors and sharp details for all your multimedia needs.",
      price: 14999,
      category: "Audio",
      type: "Others",
      brand: "Acer",
      category: "Electronics",
      stock: 100,
      details: `Vibrant 15.6-Inch FHD Display
Elevate your computing experience with the Acer AL15-41 laptop. Experience crisp and clear visuals on the 15.6-inch FHD LED-backlit display with a 60Hz refresh rate. Enjoy immersive viewing with vibrant colors and sharp details for all your multimedia needs.

Integrated AMD Radeon Graphics


Enjoy smooth graphics performance for casual gaming and multimedia tasks with integrated AMD Radeon Graphics, delivering stunning visuals for your entertainment and productivity needs.

Powerful AMD Ryzen 7 Processor

Get responsive performance and seamless multitasking with the AMD Ryzen 7-5700U Processor, featuring up to 4.3GHz and 8 cores. Whether you're working, studying, or streaming, enjoy fast and efficient computing power.`,
      currency: "SSP",
      specifications: `Display: 39.62 CMS (15.6 inches), FHD LED Backlit
      Memory: 16GB DDR4 RAM, 512GB SSD ROM
      Processor: AMD Ryen 7-5700U
      OS: Windows 11
      Graphics: Integrated AMD Radeon
      Included Software: MS Office 2021
      Multi-Gesture Touchpad, Refined Design, Independent Numeric Keypad
      Warranty: 1 year Onsite`,
      image:
        "https://media.croma.com/image/upload/v1717068665/Croma%20Assets/Computers%20Peripherals/Laptop/Images/304898_0_gybfpq.png?tr=w-480",
      images: [
        "https://media.croma.com/image/upload/v1717068667/Croma%20Assets/Computers%20Peripherals/Laptop/Images/304898_1_pzvinc.png?tr=w-100",
        "https://media.croma.com/image/upload/v1717068669/Croma%20Assets/Computers%20Peripherals/Laptop/Images/304898_2_vjkhpa.png?tr=w-100",
        "https://media.croma.com/image/upload/v1717068672/Croma%20Assets/Computers%20Peripherals/Laptop/Images/304898_3_pmhuru.png?tr=w-100",
      ],
    },

    {
      productName: `Apple MacBook Air (13.3 Inch, M1, 8GB, 256GB, macOS Big Sur, Space Grey)`,
      type: "Others",
      description: `Efficiency Unleashed

Introducing the new Apple MacBook Air 2020 powered by the groundbreaking Apple M1 chip. The M1 chip and macOS Big Sur work seamlessly to make your Mac instantly responsive. Hence, tasks like browsing the web and viewing photos are notably quick. Plus, the 16-core neural engine, capable of a whopping 11 trillion operations per second, empowers apps to perform intelligent tasks, such as automatic photo retouching and enhanced audio filters.`,
      brand: "Apple",
      category: "Electronics",
      stock: 9000,
      details: `Processor: Apple M1
Display: 33.78 cms (13.3 inches) LED-Backlit
Memory: 8GB DDR4 RAM, 256GB SSD ROM
OS: macOS Big Sur
Warranty: 1 Year Onsite`,
      currency: "SSP",
      specifications: `Laptop Category
Laptop TypeMacBook
Suitable ForStudents | Office Use | Home | Everyday Use
Launch Year2020`,
      price: 500000,
      image:
        "https://media.croma.com/image/upload/v1685966374/Croma%20Assets/Computers%20Peripherals/Laptop/Images/256711_umnwok.png?tr=w-400",
      images: [
        "https://media.croma.com/image/upload/v1685966369/Croma%20Assets/Computers%20Peripherals/Laptop/Images/256711_3_wkidwj.png?tr=w-100",
        "https://media.croma.com/image/upload/v1685966377/Croma%20Assets/Computers%20Peripherals/Laptop/Images/256711_4_nlw7rh.png?tr=w-100",
        "https://media.croma.com/image/upload/v1685966378/Croma%20Assets/Computers%20Peripherals/Laptop/Images/256711_5_r7le1h.png?tr=w-100",
        "https://media.croma.com/image/upload/v1685966378/Croma%20Assets/Computers%20Peripherals/Laptop/Images/256711_5_r7le1h.png?tr=w-100",
      ],
    },

    {
      productName:
        "Apple Watch Ultra 2 GPS+Cellular with Blue/Black Trail Loop - S/M (49mm Display, Titanium Case)",
      brand: "Apple",
      price: 84,
      type: "Others",
      category: "Electronics",
      stock: 10000,
      currency: "SSP",
      specifications: "6GB",
      image:
        "https://media.croma.com/image/upload/v1694711060/Croma%20Assets/Communication/Wearable%20Devices/Images/301048_0_x1euf9.png",
      images: [
        "https://media.croma.com/image/upload/v1694711060/Croma%20Assets/Communication/Wearable%20Devices/Images/301048_0_x1euf9.png",
        "https://media.croma.com/image/upload/v1694711063/Croma%20Assets/Communication/Wearable%20Devices/Images/301048_1_tnhlcm.png",
        "https://media.croma.com/image/upload/v1694711065/Croma%20Assets/Communication/Wearable%20Devices/Images/301048_2_ao3q6m.png",
        "https://media.croma.com/image/upload/v1694711068/Croma%20Assets/Communication/Wearable%20Devices/Images/301048_3_ttksjj.png",
        "https://media.croma.com/image/upload/v1694711071/Croma%20Assets/Communication/Wearable%20Devices/Images/301048_4_wsrvdi.png",
      ],
      details:
        "Your essential companion for a healthy life is now even more powerful. The S9 chip enables a super-bright display and a magical new way to quickly and easily interact with your Apple Watch without touching the screen. Advanced health, safety and activity features provide powerful insights and help when you need it. And redesigned apps in watchOS give you more information at a glance.",
      description:
        "Your essential companion for a healthy life is now even more powerful. The S9 chip enables a super-bright display and a magical new way to quickly and easily interact with your Apple Watch without touching the screen. Advanced health, safety and activity features provide powerful insights and help when you need it. And redesigned apps in watchOS give you more information at a glance",
    },

    {
      productName:
        "Apple iPad Air Wi-Fi (13 Inch, 256GB, Starlight, 2024 model)",
      brand: "Apple",
      price: 84,
      type: "Others",
      category: "Electronics",
      stock: 10000,
      currency: "SSP",
      specifications: `13 inches (32.78 cm) Liquid Retina Display
                            8GB RAM, 256GB ROM
                            Apple M2 Chip, Octa Core
                            iPadOS 18
                            Upto 10 Hours Battery Life
                            12 MP Primary Camera, 12 MP Front Camera
                            Landscape Stereo Speakers, Touch ID, Dolby Atmos`,
      image:
        "https://media.croma.com/image/upload/v1715758599/Croma%20Assets/Computers%20Peripherals/Tablets%20and%20iPads/Images/301955_0_dg1nns.png?tr=w-360",
      images: [
        "https://media.croma.com/image/upload/v1715758602/Croma%20Assets/Computers%20Peripherals/Tablets%20and%20iPads/Images/301955_1_g3lf6r.png?tr=w-100",

        "https://media.croma.com/image/upload/v1715758605/Croma%20Assets/Computers%20Peripherals/Tablets%20and%20iPads/Images/301955_2_m2enf7.png?tr=w-100",

        "https://media.croma.com/image/upload/v1715758606/Croma%20Assets/Computers%20Peripherals/Tablets%20and%20iPads/Images/301955_3_nbnp5x.png?tr=w-100",

        "https://media.croma.com/image/upload/v1715758622/Croma%20Assets/Computers%20Peripherals/Tablets%20and%20iPads/Images/301955_9_l75uml.png?tr=w-100",

        "https://media.croma.com/image/upload/v1715758619/Croma%20Assets/Computers%20Peripherals/Tablets%20and%20iPads/Images/301955_8_dpiru5.png?tr=w-100",
      ],
      details:
        "Your essential companion for a healthy life is now even more powerful. The S9 chip enables a super-bright display and a magical new way to quickly and easily interact with your Apple Watch without touching the screen. Advanced health, safety and activity features provide powerful insights and help when you need it. And redesigned apps in watchOS give you more information at a glance.",
      description: `Liquid Retina Display

Thanks to the high-resolution liquid retina display, the Apple 256GB IPAD AIR 13 offers a responsive and colour-accurate viewing experience that brings every task to life with impressive clarity.


Powerful M2 Chip

Powered by the M2 chip, this iPad delivers optimum performance, boasting a CPU, GPU, and neural engine. Therefore, you can enjoy seamless multitasking, immersive gaming, and AI-enabled applications with efficiency and all-day battery life.


iPadOS and Apps

The iPadOS that comes with this iPad empowers you to do everything you love easily and powerfully, from multitasking with multiple apps to precise navigation using your finger, Apple pencil, or the magic keyboard trackpad.


Apple Pencil Pro

With the Apple Pencil Pro, this iPad sets the standard for intuitive, precise, and magical drawing, painting, handwriting, and note-taking experiences. Thus, you can enjoy pixel-perfect precision, low latency, and tilt sensitivity for optimum creativity.


Magic Keyboard

Thanks to the magic keyboard, this 256GB iPad lets you experience responsive typing and precise trackpad navigation. Moreover, it features a floating cantilever design for seamless attachment and adjustable viewing angles.


Enhanced Cameras

This Apple iPad allows you to capture life's moments in impressive detail with the enhanced front and back cameras, including a landscape 12MP ultra-wide front camera with centre stage and a 12MP wide back camera with Smart HDR photos and 4K video capabilities.


Wireless Connectivity

With the Wi-Fi 6E, this iPad lets you stay connected and productive, ensuring seamless connectivity wherever you go.`,
    },

    {
      productName:
        "Apple iPad Air Wi-Fi (13 Inch, 256GB, Starlight, 2024 model)",
      brand: "Apple",
      price: 8400,
      type: "Others",
      category: "Accessories",
      stock: 10000,
      currency: "SSP",
      specifications: `13 inches (32.78 cm) Liquid Retina Display
                            8GB RAM, 256GB ROM
                            Apple M2 Chip, Octa Core
                            iPadOS 18
                            Upto 10 Hours Battery Life
                            12 MP Primary Camera, 12 MP Front Camera
                            Landscape Stereo Speakers, Touch ID, Dolby Atmos`,
      image:
        "https://media.croma.com/image/upload/v1697174641/Croma%20Assets/Entertainment/Headphones%20and%20Earphones/Images/301168_o1ugut.png?tr=w-360",
      images: [
        "https://media.croma.com/image/upload/v1697174641/Croma%20Assets/Entertainment/Headphones%20and%20Earphones/Images/301168_3_j66t6s.png?tr=w-100",

        "https://media.croma.com/image/upload/v1697174641/Croma%20Assets/Entertainment/Headphones%20and%20Earphones/Images/301168_4_p7zwuh.png?tr=w-100",

        "https://media.croma.com/image/upload/v1697174640/Croma%20Assets/Entertainment/Headphones%20and%20Earphones/Images/301168_5_agdrfp.png?tr=w-100",

        "https://media.croma.com/image/upload/v1697174641/Croma%20Assets/Entertainment/Headphones%20and%20Earphones/Images/301168_6_ftbibd.png?tr=w-100",
      ],
      details:
        "Your essential companion for a healthy life is now even more powerful. The S9 chip enables a super-bright display and a magical new way to quickly and easily interact with your Apple Watch without touching the screen. Advanced health, safety and activity features provide powerful insights and help when you need it. And redesigned apps in watchOS give you more information at a glance.",
      description: `Immerse Yourself in Rich Bass Tones

 

Elevate your audio experience with Apple EarPods wired headphones. The exceptional headphone delivers deep, rich bass tones that add a new dimension to your favorite tracks. Whether you're a music enthusiast or an avid podcast listener, you'll appreciate the enhanced sound quality that EarPods provide. Get ready to rediscover your favorite tunes with a level of clarity and depth you've never experienced before.

 

 

 

High-Quality Audio for an Elevated Experience

 

Apple EarPods are engineered to maximize sound output, ensuring you receive high-quality audio every time you plug in. Whether you're enjoying music, movies, or podcasts, you'll appreciate the clear and crisp audio that EarPods deliver. With the headphone, you can immerse yourself in your entertainment and catch every subtle nuance, enhancing your overall listening pleasure.

 

 

 

Stay Active with Sweat and Water Resistance

 

Don't let your active lifestyle hinder your music experience. Apple EarPods provide protection from sweat and water, allowing you to enjoy your favorite tunes during workouts, outdoor activities, and even in light rain. With the headphone, you can stay in the groove without worrying about potential damage from moisture. It's the perfect companion for those on the move.

 

 

 

Effortless Control at Your Fingertips

 

Experience convenience like never before with Apple EarPods' built-in remote. This intuitive feature allows you to effortlessly adjust music and video playback without having to reach for your device. Additionally, you can easily answer and end calls, ensuring you stay connected while on the go. With EarPods, you have complete control at your fingertips, enhancing your overall user experience.

 

 

 

Unmatched Comfort for Extended Enjoyment

 

Apple EarPod is designed with your comfort in mind. Its unique shape is defined by the natural geometry of the ear, making it more comfortable for a wider range of people compared to other earbud-style headphones. This means you can enjoy your music for longer periods without experiencing discomfort or fatigue. With EarPods, you can indulge in uninterrupted audio bliss, whether you're on a long commute or in the middle of an extended listening session.`,
    },
  ];

  try {
    // Seeding predefined products
    for (const product of products) {
      await databases.createDocument(
        Config.databaseId,
        Config.productCollectionId,
        ID.unique(),
        product
      );
      console.log(`Added product: ${product.productName}`);
    }

    // Dynamically generating additional products
    const count = 100; // Define how many additional products you want to create
    const categories = [
      "All",
      "Accessories",
      "Jewelry",
      "Clothing",
      "Sports",
      "HomeItems",
      "Electronics",
    ];
    for (let i = 0; i < count; i++) {
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];
      await databases.createDocument(
        Config.databaseId,
        Config.productCollectionId,
        ID.unique(),

        {
          productName: `Product ${i + 1}`,
          category: randomCategory,
          brand: "Apple",
          price: Math.floor(Math.random() * 100) + 10,
          image:
            "https://media.croma.com/image/upload/v1741368885/Croma%20Assets/Computers%20Peripherals/Laptop/Images/314779_0_opnked.png?tr=w-400",
          description: `Description for Product ${i + 1}`, // ✅ Added missing field
          details: `Details for Product ${i + 1}`,
          stock: Math.floor(Math.random() * 50) + 1, // ✅ Added missing "stock" field
          specifications: `Specifications for Product ${i + 1}`,
        }
      );
      console.log(`Added dynamic product: Product ${i + 1}`);
    }

    console.log("Seeding completed!");
  } catch (error) {
    console.error("Error seeding products:", error);
  }
};

export default seedProducts;

/*  seedProducts();   */

// TODO: add the correct default export manually
