import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from '@/lib/utils';

const products = [
  { id: 'p1', name: 'Premium Wireless Headphones', category: 'Electronics', stock: 120, price: 149.99, status: 'In Stock' },
  { id: 'p2', name: 'Ergonomic Office Chair', category: 'Furniture', stock: 45, price: 299.00, status: 'In Stock' },
  { id: 'p3', name: 'Organic Green Tea', category: 'Groceries', stock: 300, price: 12.50, status: 'In Stock' },
  { id: 'p4', name: 'Smart Fitness Tracker', category: 'Wearables', stock: 8, price: 79.95, status: 'Low Stock' },
  { id: 'p5', name: 'Hardcover Notebook Set', category: 'Stationery', stock: 0, price: 22.00, status: 'Out of Stock' },
];

const getBadgeVariant = (status: string) => {
    switch (status) {
        case 'In Stock': return 'secondary';
        case 'Low Stock': return 'default';
        case 'Out of Stock': return 'destructive';
        default: return 'outline';
    }
};

const getBadgeClassName = (status: string) => {
    switch (status) {
        case 'In Stock': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        case 'Low Stock': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        case 'Out of Stock': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        default: return '';
    }
}


export default function ProductList() {
    const productImages = PlaceHolderImages.filter(p => p.id.startsWith('product-'));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>List of all products in your inventory.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead className="hidden md:table-cell">Category</TableHead>
                            <TableHead className="hidden md:table-cell">Stock</TableHead>
                            <TableHead className="hidden sm:table-cell">Price</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => {
                            const image = productImages.find(img => img.id === product.id);
                            return (
                                <TableRow key={product.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        {image && (
                                            <Image
                                                alt={product.name}
                                                className="aspect-square rounded-md object-cover"
                                                data-ai-hint={image.imageHint}
                                                height="64"
                                                src={image.imageUrl}
                                                width="64"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="hidden md:table-cell">{product.category}</TableCell>
                                    <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                                    <TableCell className="hidden sm:table-cell">${product.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getBadgeVariant(product.status)} className={cn('capitalize', getBadgeClassName(product.status))}>
                                            {product.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
