### 1. **Set Up a Python Virtual Environment**
- First, make sure Python is installed on each laptop.
- To keep project dependencies isolated, it’s recommended to set up a virtual environment.
- To create a virtual environment, open a terminal and run:
```bash
python -m venv myenv
```
- This will create a folder called `myenv`. Activate the environment with:
    - Windows: `myenv\Scripts\activate`
    - Mac/Linux: `source myenv/bin/activate`

### 2. **Install Django**
- With the virtual environment activated, install Django:
```bash
pip install django
```

### 3. **Create a Django Project**
- Create a new Django project by running:
```bash
django-admin startproject projectname
```
    
- This command generates a folder containing `manage.py` and other configuration files necessary to start your project.
