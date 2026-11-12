resource "aws_eip" "lb_eip_1" {
  domain = "vpc"
  tags = {
    Name = "movie-catalog-eip-1"
  }
}

resource "aws_eip" "lb_eip_2" {
  domain = "vpc"
  tags = {
    Name = "movie-catalog-eip-2"
  }
}

output "eip_allocation_ids" {
  value = [aws_eip.lb_eip_1.id, aws_eip.lb_eip_2.id]
}