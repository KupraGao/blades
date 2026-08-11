type Props = {
  disabled?: boolean;
};

export default function PlaceOrderButton({
  disabled = false,
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="
        w-full
        rounded-xl
        bg-black
        px-5
        py-3
        font-semibold
        text-white
        transition
        hover:opacity-90
        disabled:cursor-not-allowed
        disabled:opacity-50
        dark:bg-white
        dark:text-black
      "
    >
      Place Order
    </button>
  );
}