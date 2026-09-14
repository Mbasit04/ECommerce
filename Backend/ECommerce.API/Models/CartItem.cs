using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerce.API.Models
{
    public class CartItem
    {
        public int Id { get; set; }

        public int CartId { get; set; }

        public Cart Cart { get; set; } = null!;

        public int ProductId { get; set; }

        public Product Product { get; set; } = null!;

        public int Quantity { get; set; }

        public decimal Price { get; set; }

        [NotMapped]
        public decimal UnitPrice
        {
            get => Price;
            set => Price = value;
        }
    }
}
