import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Service = () => {
  return (
    <div className="bg-gray-100">
      <Navbar />

      <div className="container mx-auto " style={{ paddingTop: '100px', marginBottom: '50px' }}>
        {/* Header Section */}
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">
          Our Services
        </h1>
        <p className="text-lg text-center text-gray-700 mb-12">
          Discover the range of services we offer to make communication through
          Indian Sign Language accessible and seamless for everyone.
        </p>

        {/* Services Grid */}
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Service 1 */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <div className="text-blue-500 text-4xl mb-4">
              <i className="fas fa-language"></i>
            </div>
            <h2 className="text-xl font-semibold mb-3">Speech-to-ISL Translation</h2>
            <p className="text-gray-600">
              Convert spoken language into Indian Sign Language animations
              effortlessly.
            </p>
          </div>

          {/* Service 2 */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <div className="text-blue-500 text-4xl mb-4">
              <i className="fas fa-comments"></i>
            </div>
            <h2 className="text-xl font-semibold mb-3">Text-to-ISL Conversion</h2>
            <p className="text-gray-600">
              Translate written text into ISL for better understanding and accessibility.
            </p>
          </div>

          {/* Service 3 */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <div className="text-blue-500 text-4xl mb-4">
              <i className="fas fa-video"></i>
            </div>
            <h2 className="text-xl font-semibold mb-3">Video Captioning in ISL</h2>
            <p className="text-gray-600">
              Add ISL captions to videos, making visual content inclusive for all.
            </p>
          </div>

          {/* Service 4 */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <div className="text-blue-500 text-4xl mb-4">
              <i className="fas fa-hand-holding-heart"></i>
            </div>
            <h2 className="text-xl font-semibold mb-3">Accessibility Tools</h2>
            <p className="text-gray-600">
              Empower individuals with advanced tools for communication and learning.
            </p>
          </div>

          {/* Service 5 */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <div className="text-blue-500 text-4xl mb-4">
              <i className="fas fa-brain"></i>
            </div>
            <h2 className="text-xl font-semibold mb-3">AI-Powered Solutions</h2>
            <p className="text-gray-600">
              Leverage AI-driven technologies for accurate and real-time translations.
            </p>
          </div>

          {/* Service 6 */}
          <div className="bg-white shadow-md rounded-lg  text-center">
            <div className="text-blue-500 text-4xl ">
              <i className="fas fa-users"></i>
            </div>
            <h2 className="text-xl font-semibold ">Community Support</h2>
            <p className="text-gray-600">
              Join a community of developers, linguists, and educators passionate
              about ISL.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Service;