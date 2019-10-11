from setuptools import setup

setup(
    name='ctcoop',
    version="0.1",
    author='Mario Balibrera',
    author_email='mario.balibrera@gmail.com',
    license='MIT License',
    description='Cooperative organization plugin for cantools (ct)',
    long_description='This package provides organizational management tools (in the form of web pages and components) for a cooperative.',
    packages=[
        'ctcoop'
    ],
    zip_safe = False,
    install_requires = [
#        "ct >= 0.8.7"
    ],
    entry_points = '''''',
    classifiers = [
        'Development Status :: 3 - Alpha',
        'Environment :: Console',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Software Development :: Libraries :: Python Modules'
    ],
)
