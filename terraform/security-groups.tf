# Security Group for EKS Cluster
resource "aws_security_group" "eks_cluster" {
  name        = "movie-catalog-eks-cluster-sg"
  description = "Cluster communication with worker nodes"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "movie-catalog-eks-cluster-sg"
  }
}