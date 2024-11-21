import os

def write_file_tree_and_content(directory, output_file):
    # Open the output file
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write("Directory Structure:\n\n")
        
        # Walk through the directory tree
        for root, dirs, files in os.walk(directory):
            # Calculate the indentation level for the tree structure
            level = root.replace(directory, '').count(os.sep)
            indent = ' ' * 4 * level
            file.write(f"{indent}{os.path.basename(root)}/\n")
            
            # List files in the current directory
            sub_indent = ' ' * 4 * (level + 1)
            for f in files:
                file.write(f"{sub_indent}{f}\n")
                
        file.write("\n\nFiles with '.js' or '.tsx' extensions and their content:\n\n")
        
        # Walk through again to find .js and .tsx files and write their content
        for root, _, files in os.walk(directory):
            for f in files:
                if f.endswith('.js') or f.endswith('.tsx'):
                    file_path = os.path.join(root, f)
                    file.write(f"File: {file_path}\n")
                    file.write("=" * 80 + "\n")
                    
                    # Write the content of the file
                    try:
                        with open(file_path, 'r', encoding='utf-8') as code_file:
                            content = code_file.read()
                            file.write(content)
                    except Exception as e:
                        file.write(f"Error reading file: {e}\n")
                    
                    file.write("\n" + "=" * 80 + "\n\n")


if __name__ == "__main__":
    # Set the directory to the current directory
    current_directory = os.getcwd()
    output_file = os.path.join(current_directory, "directory_with_content.txt")
    
    write_file_tree_and_content(current_directory, output_file)
    print(f"Directory description and file content written to {output_file}")
