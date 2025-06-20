import java.io.*;
import java.util.*;

public class InventoryManagementSystem {
    static class Item {
        String id;
        String name;
        int quantity;
        double price;

        Item(String id, String name, int quantity, double price) {
            this.id = id;
            this.name = name;
            this.quantity = quantity;
            this.price = price;
        }

        @Override
        public String toString() {
            return id + "," + name + "," + quantity + "," + price;
        }

        static Item fromString(String line) {
            String[] parts = line.split(",");
            return new Item(parts[0], parts[1], Integer.parseInt(parts[2]), Double.parseDouble(parts[3]));
        }
    }

    private static final String FILE_NAME = "inventory.txt";
    private static final Map<String, Item> inventory = new HashMap<>();

    public static void main(String[] args) {
        loadInventory();
        Scanner sc = new Scanner(System.in);
        int choice;

        do {
            System.out.println("\n--- Inventory Management System ---");
            System.out.println("1. Add Item");
            System.out.println("2. View Items");
            System.out.println("3. Update Quantity");
            System.out.println("4. Delete Item");
            System.out.println("5. Exit");
            System.out.print("Enter choice: ");
            choice = sc.nextInt();

            switch (choice) {
                case 1 -> addItem(sc);
                case 2 -> viewItems();
                case 3 -> updateQuantity(sc);
                case 4 -> deleteItem(sc);
                case 5 -> saveInventory();
                default -> System.out.println("Invalid choice!");
            }
        } while (choice != 5);
        sc.close();
    }

    private static void addItem(Scanner sc) {
        System.out.print("Enter ID: ");
        String id = sc.next();
        if (inventory.containsKey(id)) {
            System.out.println("Item already exists!");
            return;
        }
        System.out.print("Enter Name: ");
        String name = sc.next();
        System.out.print("Enter Quantity: ");
        int qty = sc.nextInt();
        System.out.print("Enter Price: ");
        double price = sc.nextDouble();

        inventory.put(id, new Item(id, name, qty, price));
        System.out.println("Item added!");
    }

    private static void viewItems() {
        System.out.println("\n--- Inventory ---");
        if (inventory.isEmpty()) {
            System.out.println("No items in inventory.");
            return;
        }
        for (Item item : inventory.values()) {
            System.out.printf("ID: %s | Name: %s | Qty: %d | Price: %.2f\n",
                    item.id, item.name, item.quantity, item.price);
        }
    }

    private static void updateQuantity(Scanner sc) {
        System.out.print("Enter Item ID to update: ");
        String id = sc.next();
        if (inventory.containsKey(id)) {
            System.out.print("Enter new quantity: ");
            int qty = sc.nextInt();
            inventory.get(id).quantity = qty;
            System.out.println("Quantity updated!");
        } else {
            System.out.println("Item not found.");
        }
    }

    private static void deleteItem(Scanner sc) {
        System.out.print("Enter Item ID to delete: ");
        String id = sc.next();
        if (inventory.remove(id) != null) {
            System.out.println("Item deleted.");
        } else {
            System.out.println("Item not found.");
        }
    }

    private static void saveInventory() {
        try (PrintWriter writer = new PrintWriter(new FileWriter(FILE_NAME))) {
            for (Item item : inventory.values()) {
                writer.println(item);
            }
            System.out.println("Inventory saved.");
        } catch (IOException e) {
            System.out.println("Error saving inventory.");
        }
    }

    private static void loadInventory() {
        try (BufferedReader reader = new BufferedReader(new FileReader(FILE_NAME))) {
            String line;
            while ((line = reader.readLine()) != null) {
                Item item = Item.fromString(line);
                inventory.put(item.id, item);
            }
        } catch (IOException e) {
            System.out.println("No previous inventory found. Starting new.");
        }
    }
}
