import Products from "../components/Products/Products";

function Home() {
  return (
    <div>
      <Products submitTarget="/checkout" />
    </div>
  );
}
export default Home;
