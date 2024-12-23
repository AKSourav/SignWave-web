import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Contact = () => {


  return (
    <>
      <Navbar />

      <div className="container-fluid " style={{ paddingTop: '100px' }}>
        <div className="row justify-content-center text-center">
          <div className="col-12 col-md-12">
            <h1 ><span>-</span>Contact Us<span>-</span></h1>
            <p  >
              Explore Our Recent Creations, Demonstrating Our Commitment to Delivering Transformative Digital Solutions.
            </p>
            {/* <button type="button" className="btn btn-lg btn-primary mb-3 mb-md-4 mb-xl-5">Connect Now</button> */}
          </div>
        </div>
      </div>
      <div className="container-fluid opacity-90   " >
        <div className="row" style={{
          backgroundImage: `url('https://cdn.pixabay.com/photo/2015/09/21/23/28/love-sign-950912_1280.jpg')`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
          <div className="col-md-6 flex flex-col justify-center items-center text-center text-white">
            <h1>Contact Us</h1>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim ratione, accusamus ad sit error cum!</p>
          </div>

          <div className="col-md-6">
            <div className="max-w-sm mx-auto m-5">
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  id="email"
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                  placeholder="name@flowbite.com"
                  required
                />
              </div>

              <div className="mb-5">
                <label
                  htmlFor="Full Name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your Full Name
                </label>
                <input
                  type="text"
                  id="First Name"
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                  required
                />
              </div>

              <div className="mb-5">
                <label
                  htmlFor="Phone"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Phone number
                </label>
                <input
                  type="number"
                  id="Phone"
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                  required
                />
              </div>

              <div className="flex items-start mb-5">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                    required
                  />
                </div>
                <label
                  htmlFor="terms"
                  className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  I agree with the{" "}
                  <a href="#" className="text-blue-600 hover:underline dark:text-blue-500">
                    terms and conditions
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Contact;