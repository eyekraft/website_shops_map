# https://gist.github.com/sehrishnaz/2f7ead70f1ab8927325f5f14a747c000

import os
import subprocess
import sys


class Install_Packages:
    """
    This Class installs required Packages or library
    """

    get_pckg = subprocess.check_output([sys.executable, '-m', 'pip', 'freeze'])
    installed_packages = [r.decode().split('==')[0] for r in get_pckg.split()]

    # List of your required packages from pip requirements file
    requirements_file = '%s/requirements.txt' % os.path.dirname(os.path.realpath(__file__))
    required_packages = open(requirements_file, 'r')
    for packg in required_packages:
        if packg in installed_packages:
            pass
        else:
            print('Installing %s package' % packg)
            os.system('pip3 install ' + packg)
