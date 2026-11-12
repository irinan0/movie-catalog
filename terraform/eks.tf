# Fetch the pre-configured LabRole provided by the AWS Academy / Voclabs environment
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# Create EKS Cluster using both public subnets across different AZs
resource "aws_eks_cluster" "main" {
  name     = "movie-catalog-cluster"
  role_arn = data.aws_iam_role.lab_role.arn
  version  = "1.31"

  vpc_config {
    subnet_ids         = [aws_subnet.public.id, aws_subnet.public_2.id]
    security_group_ids = [aws_security_group.eks_cluster.id]
  }

  tags = {
    Name = "movie-catalog-eks"
  }
}

# Create EKS Node Group using both subnets
resource "aws_eks_node_group" "nodes" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "movie-catalog-node-group"
  node_role_arn   = data.aws_iam_role.lab_role.arn
  subnet_ids      = [aws_subnet.public.id, aws_subnet.public_2.id]
  instance_types  = ["t3.medium"]

  scaling_config {
    desired_size = 1
    max_size     = 2
    min_size     = 1
  }
}