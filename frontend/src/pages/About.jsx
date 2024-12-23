import Footer from "../components/Footer"
import Navbar from "../components/Navbar"

const About = () => {
  return (
    <div>
      <Navbar />
      <div className="bg-gray-100 text-gray-800 py-10 px-5">
        <div className="container mx-auto max-w-4xl" style={{ marginTop: '40px' }}>
          {/* Header Section */}
          <h1 className="text-4xl font-bold text-center text-blue-600 mb-6">
            About Us
          </h1>

          {/* Intro Section */}
          <p className="text-lg text-center mb-8 leading-relaxed">
            Welcome to the <strong>Indian Sign Language Translator</strong> project!
            Our mission is to bridge the communication gap between the hearing and
            hearing-impaired communities through advanced AI-driven tools.
          </p>

          {/* Features Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h2 className="text-2xl font-semibold text-blue-500 mb-3">
                What We Do
              </h2>
              <p className="text-gray-600">
                We provide a seamless platform to convert speech and text into
                Indian Sign Language (ISL) and vice versa. Leveraging cutting-edge
                technologies, our application ensures accurate translations and
                promotes inclusivity.
              </p>
            </div>
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h2 className="text-2xl font-semibold text-blue-500 mb-3">
                Our Vision
              </h2>
              <p className="text-gray-600">
                To empower the hearing-impaired community by enabling effortless
                communication, fostering understanding, and making Indian Sign
                Language accessible to all.
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-white mt-10 p-6 shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold text-blue-500 mb-3 text-center">
              Meet the Team
            </h2>
            <p className="text-gray-600 text-center">
              Our dedicated team of developers, data scientists, and linguists
              work tirelessly to create a robust and user-friendly platform for
              ISL translation.
            </p>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-10">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Join Us in Making a Difference
            </h3>
            <p className="text-gray-600 mb-6">
              Interested in contributing to our mission? Contact us today or learn
              more about our project.
            </p>
            <a
              href="/"
              className="px-6 py-3 bg-blue-500 text-white rounded-md shadow-lg hover:bg-blue-600"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default About