namespace ECommerce.API.Models
{
    public class PaymentMethod
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public static implicit operator string(PaymentMethod? pm) => pm?.Name ?? string.Empty;
        public static implicit operator PaymentMethod(string? name) => new PaymentMethod { Name = name ?? string.Empty };
    }
}
