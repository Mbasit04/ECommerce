using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerce.API.Models
{
    public class Order
    {
        public int Id { get; set; }


        // =========================
        // CUSTOMER
        // =========================

        public int CustomerId { get; set; }

        public User Customer { get; set; } = null!;


        // =========================
        // ORDER AMOUNTS
        // =========================

        public decimal SubTotal { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal ShippingAmount { get; set; }

        public decimal TotalAmount { get; set; }


        // =========================
        // ORDER STATUS
        // =========================

        public OrderStatus Status { get; set; }
            = OrderStatus.Pending;


        // =========================
        // PAYMENT STATUS
        // =========================

        public PaymentStatus PaymentStatus { get; set; }
            = PaymentStatus.Pending;


        // =========================
        // PAYMENT METHOD
        // =========================

        public int PaymentMethodId { get; set; }

        public PaymentMethod PaymentMethod { get; set; } = null!;

        // Stores the actual payment type used by the customer.
        // Example: COD or Stripe
        public string PaymentMethodType { get; set; }
            = "COD";


        // =========================
        // PAYMENT
        // =========================

        public Payment? Payment { get; set; }

        public Transaction? Transaction { get; set; }


        // =========================
        // SHIPPING
        // =========================

        public Shipping? Shipping { get; set; }

        public string? ShippingAddress { get; set; }

        public string? City { get; set; }

        public string? PhoneNumber { get; set; }

        [NotMapped]
        public string? TrackingNumber
        {
            get => Shipping?.TrackingNumber;
            set
            {
                if (Shipping == null)
                    Shipping = new Shipping { OrderId = Id, Address = ShippingAddress ?? string.Empty, City = City ?? string.Empty };
                Shipping.TrackingNumber = value;
            }
        }

        [NotMapped]
        public DateTime? ShippedAt
        {
            get => Shipping?.ShippedAt;
            set
            {
                EnsureShipping().ShippedAt = value;
            }
        }

        [NotMapped]
        public DateTime? DeliveredAt
        {
            get => Shipping?.DeliveredAt;
            set
            {
                EnsureShipping().DeliveredAt = value;
            }
        }

        private Shipping EnsureShipping()
        {
            Shipping ??= new Shipping
            {
                OrderId = Id,
                Address = ShippingAddress ?? string.Empty,
                City = City ?? string.Empty
            };

            return Shipping;
        }


        // =========================
        // DATES
        // =========================

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [NotMapped]
        public DateTime OrderDate
        {
            get => CreatedAt;
            set => CreatedAt = value;
        }


        // =========================
        // ORDER ITEMS
        // =========================

        public ICollection<OrderItem> OrderItems { get; set; }
            = new List<OrderItem>();
    }
}
